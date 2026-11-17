const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const absolute = (file) => path.resolve(root, file);
const read = (file) => fs.readFileSync(absolute(file), 'utf8');
const walk = (directory) =>
  fs
    .readdirSync(absolute(directory), { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? ['coverage-test', 'node_modules', 'dist'].includes(entry.name)
          ? []
          : walk(`${directory}/${entry.name}`)
        : [`${directory}/${entry.name}`],
    );
const decorators = (node) =>
  (ts.canHaveDecorators(node) ? ts.getDecorators(node) : []) ?? [];
const calls = (node, name) =>
  decorators(node)
    .map((item) => item.expression)
    .filter(
      (item) => ts.isCallExpression(item) && item.expression.getText() === name,
    );
const textArgument = (call, index = 0) => {
  const argument = call?.arguments[index];
  return argument && ts.isStringLiteralLike(argument) ? argument.text : '';
};
const normalizePath = (value) =>
  `/${value.split('/').filter(Boolean).join('/')}`;
const methods = ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head'];

function discover() {
  const files = walk('src');
  const routes = [];
  const modules = [];
  const controllers = [];
  const config = ts.readConfigFile(
    absolute('tsconfig.json'),
    ts.sys.readFile,
  ).config;
  const options = ts.convertCompilerOptionsFromJson(
    config.compilerOptions,
    root,
  ).options;
  for (const file of files.filter(
    (item) => item.endsWith('.module.ts') || item.endsWith('.controller.ts'),
  )) {
    const source = ts.createSourceFile(
      file,
      read(file),
      ts.ScriptTarget.Latest,
      true,
    );
    const imports = new Map();
    for (const statement of source.statements.filter(ts.isImportDeclaration)) {
      if (
        !statement.importClause?.namedBindings ||
        !ts.isNamedImports(statement.importClause.namedBindings)
      )
        continue;
      const resolved = ts.resolveModuleName(
        statement.moduleSpecifier.text,
        absolute(file),
        options,
        ts.sys,
      ).resolvedModule?.resolvedFileName;
      for (const binding of statement.importClause.namedBindings.elements) {
        if (resolved) imports.set(binding.name.text, relative(resolved));
      }
    }
    for (const declaration of source.statements.filter(ts.isClassDeclaration)) {
      if (!declaration.name) continue;
      if (calls(declaration, 'Module').length && file !== 'src/app.module.ts') {
        modules.push({ name: declaration.name.text, file });
      }
      const controller = calls(declaration, 'Controller')[0];
      if (!controller) continue;
      const controllerName = declaration.name.text;
      controllers.push({ name: controllerName, file });
      const constructor = declaration.members.find(ts.isConstructorDeclaration);
      const services = new Map(
        (constructor?.parameters ?? []).map((parameter) => [
          parameter.name.getText(source),
          imports.get(parameter.type?.getText(source)),
        ]),
      );
      for (const member of declaration.members.filter(ts.isMethodDeclaration)) {
        const httpMethod = methods.find(
          (method) => calls(member, method).length,
        );
        if (!httpMethod) continue;
        const parameters = member.parameters.map((parameter) => {
          const binding = [
            'Body',
            'Query',
            'Param',
            'UploadedFile',
            'Req',
            'Request',
          ].find((name) => calls(parameter, name).length);
          const bindingCall = calls(parameter, binding)[0];
          const type = parameter.type?.getText(source) ?? 'any';
          return {
            name: parameter.name.getText(source),
            binding,
            key: textArgument(bindingCall),
            type,
            typeFile: imports.get(type),
            pipes: (bindingCall?.arguments ?? [])
              .slice(1)
              .map((argument) => argument.getText(source)),
          };
        });
        const serviceCalls = [];
        function visit(node) {
          if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression)
          ) {
            const receiver = node.expression.expression;
            if (
              ts.isPropertyAccessExpression(receiver) &&
              receiver.expression.kind === ts.SyntaxKind.ThisKeyword
            ) {
              const serviceFile = services.get(receiver.name.text);
              if (serviceFile)
                serviceCalls.push({
                  file: serviceFile,
                  method: node.expression.name.text,
                });
            }
          }
          ts.forEachChild(node, visit);
        }
        if (member.body) visit(member.body);
        const guards = [
          ...calls(declaration, 'UseGuards'),
          ...calls(member, 'UseGuards'),
        ].flatMap((call) =>
          call.arguments.map((argument) => argument.getText(source)),
        );
        const permissions = calls(member, 'RequirePermissions').flatMap(
          (call) => call.arguments.map((argument) => argument.text),
        );
        const httpCode = calls(member, 'HttpCode')[0]?.arguments[0]?.getText(
          source,
        );
        const segments = file.split('/');
        const domain =
          segments[1] === 'modules'
            ? segments[2]
            : segments[1] === 'shared'
              ? 'shared'
              : segments[1] === 'q10'
                ? 'q10'
                : 'sistema';
        routes.push({
          operationId: `${controllerName}_${member.name.getText(source)}`,
          method: httpMethod.toUpperCase(),
          path: normalizePath(
            `${textArgument(controller)}/${textArgument(calls(member, httpMethod)[0])}`,
          ),
          controller: controllerName,
          handler: member.name.getText(source),
          controllerFile: file,
          line:
            source.getLineAndCharacterOfPosition(member.getStart(source)).line +
            1,
          domain,
          module: segments.length > 2 ? segments.at(-2) : 'app',
          successStatus: httpCode
            ? Number(httpCode)
            : httpMethod === 'Post'
              ? 201
              : 200,
          guards,
          permissions,
          serviceCalls,
          parameters,
          multipart: calls(member, 'UseInterceptors').some((call) =>
            call.getText(source).includes('FileInterceptor'),
          ),
        });
      }
    }
  }
  return {
    modules: modules.sort((a, b) => a.name.localeCompare(b.name)),
    controllers: controllers.sort((a, b) => a.name.localeCompare(b.name)),
    routes: routes.sort((a, b) => a.operationId.localeCompare(b.operationId)),
  };
}

function security(route) {
  const result = {};
  if (route.guards.some((guard) => guard === 'ApiKeyGuard'))
    result['api-key'] = [];
  if (
    route.guards.some((guard) =>
      /JwtAuthGuard|AuthGuard\(['"]jwt['"]\)/.test(guard),
    )
  )
    result.jwt = [];
  return Object.keys(result).length ? [result] : [];
}

module.exports = {
  root,
  absolute,
  relative,
  read,
  walk,
  discover,
  security,
  normalizePath,
};
