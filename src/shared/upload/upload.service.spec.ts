import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConstanciasService } from 'src/modules/administrativas/constancias/constancias.service';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;
  let driveClient: {
    files: {
      get: jest.Mock;
      list: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
    permissions: {
      list: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    process.env.GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO =
      'repository-folder';
    process.env.GOOGLE_DRIVE_FOLDER_CERTIFICADOS = 'certificates-folder';
    process.env.GOOGLE_DRIVE_FOLDER_CERTIFICADOS_REPOSITORIO =
      'certificates-repository';
    service = new UploadService({
      update: jest.fn(),
    } as unknown as ConstanciasService);
    driveClient = {
      files: {
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      permissions: {
        list: jest.fn().mockResolvedValue({
          data: { permissions: [{ type: 'anyone', role: 'reader' }] },
        }),
        create: jest.fn(),
      },
    };
    Reflect.set(service, 'driveClient', driveClient);
  });

  it('selects the newest signed version and ignores unrelated files', async () => {
    driveClient.files.get.mockResolvedValue({
      data: {
        id: 'original-id',
        name: 'constancia-123-Juan Perez.pdf',
        parents: ['source-folder'],
        webViewLink: 'original-view',
      },
    });
    driveClient.files.list
      .mockResolvedValueOnce({
        data: {
          files: [
            {
              id: 'old-signed-id',
              name: '[FIRMADO] constancia-123-Juan Perez.pdf',
              modifiedTime: '2026-06-18T10:00:00.000Z',
            },
            {
              id: 'new-signed-id',
              name: 'constancia-123-Juan Perez[FIRMADO]',
              modifiedTime: '2026-06-19T10:00:00.000Z',
            },
            {
              id: 'unrelated-id',
              name: '[FIRMADO] constancia-999-Otro.pdf',
              modifiedTime: '2026-06-20T10:00:00.000Z',
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { files: [] } });

    const result = await service.findSignedVersion('original-id');

    expect(result.originalFile.id).toBe('original-id');
    expect(result.signedFile.id).toBe('new-signed-id');
    expect(driveClient.files.list).toHaveBeenCalledTimes(2);
    expect(driveClient.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      }),
    );
  });

  it('uses and validates a signed file id without listing folders', async () => {
    driveClient.files.get
      .mockResolvedValueOnce({
        data: {
          id: 'original-id',
          name: 'constancia-123-Juan Perez.pdf',
          parents: ['source-folder'],
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 'signed-id',
          name: 'constancia-123-Juan Perez[FIRMADO].pdf',
        },
      });

    const result = await service.findSignedVersion('original-id', 'signed-id');

    expect(result.signedFile.id).toBe('signed-id');
    expect(driveClient.files.list).not.toHaveBeenCalled();
    expect(driveClient.files.get).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        fileId: 'signed-id',
        supportsAllDrives: true,
      }),
    );
  });

  it('rejects a signed file id belonging to another constancia', async () => {
    driveClient.files.get
      .mockResolvedValueOnce({
        data: { id: 'original-id', name: 'constancia-123.pdf' },
      })
      .mockResolvedValueOnce({
        data: { id: 'signed-id', name: 'constancia-999[FIRMADO].pdf' },
      });

    await expect(
      service.findSignedVersion('original-id', 'signed-id'),
    ).rejects.toThrow(BadRequestException);
  });

  it('finds a signed version already moved to the repository', async () => {
    driveClient.files.get.mockResolvedValue({
      data: {
        id: 'original-id',
        name: 'constancia-123.pdf',
        parents: ['source-folder'],
      },
    });
    driveClient.files.list
      .mockResolvedValueOnce({ data: { files: [] } })
      .mockResolvedValueOnce({
        data: {
          files: [
            {
              id: 'signed-id',
              name: '[FIRMADO] constancia-123.pdf',
              modifiedTime: '2026-06-19T10:00:00.000Z',
            },
          ],
        },
      });

    const result = await service.findSignedVersion('original-id');

    expect(result.signedFile.id).toBe('signed-id');
  });

  it('fails when there is no matching signed version', async () => {
    driveClient.files.get.mockResolvedValue({
      data: {
        id: 'original-id',
        name: 'constancia-123.pdf',
        parents: ['source-folder'],
      },
    });
    driveClient.files.list.mockResolvedValue({ data: { files: [] } });

    await expect(service.findSignedVersion('original-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('does not move a file that is already in the repository', async () => {
    driveClient.files.get.mockResolvedValue({
      data: {
        id: 'signed-id',
        name: '[FIRMADO] constancia-123.pdf',
        parents: ['repository-folder'],
        webViewLink: 'signed-view',
      },
    });

    const result = await service.moveFileToRepository('signed-id');

    expect(result.id).toBe('signed-id');
    expect(driveClient.files.update).not.toHaveBeenCalled();
    expect(driveClient.permissions.list).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'signed-id',
        supportsAllDrives: true,
      }),
    );
  });

  it('uploads certificate files to the configured source folder', async () => {
    driveClient.files.create.mockResolvedValue({
      data: {
        id: 'certificate-id',
        name: 'certificado-1-Juan Perez.pdf',
        webViewLink: 'view-link',
        webContentLink: 'download-link',
      },
    });
    const file = {
      originalname: 'documento.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('pdf'),
    } as Express.Multer.File;

    const result = await service.uploadToDrive(
      file,
      'CERTIFICADOS',
      'certificado-1-Juan Perez',
    );

    expect(driveClient.files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        supportsAllDrives: true,
        requestBody: expect.objectContaining({
          parents: ['certificates-folder'],
        }),
      }),
    );
    expect(result).toMatchObject({
      id: 'certificate-id',
      folder: 'CERTIFICADOS',
    });
  });

  it('finds the exact certificate period folder', async () => {
    driveClient.files.list.mockResolvedValue({
      data: {
        files: [
          { id: 'similar-folder', name: '202607-old' },
          { id: 'period-folder', name: '202607' },
        ],
      },
    });

    await expect(
      service.getCertificatePeriodFolderId('202607'),
    ).resolves.toBe('period-folder');
    expect(driveClient.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        q: expect.stringContaining("name = '202607'"),
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      }),
    );
  });

  it('fails when the certificate period folder does not exist', async () => {
    driveClient.files.list.mockResolvedValue({ data: { files: [] } });

    await expect(
      service.getCertificatePeriodFolderId('202607'),
    ).rejects.toThrow(NotFoundException);
  });

  it('searches signed certificates in the supplied period folder', async () => {
    driveClient.files.get.mockResolvedValue({
      data: {
        id: 'original-id',
        name: 'certificado-123.pdf',
        parents: ['source-folder'],
      },
    });
    driveClient.files.list
      .mockResolvedValueOnce({ data: { files: [] } })
      .mockResolvedValueOnce({
        data: {
          files: [
            {
              id: 'signed-id',
              name: 'certificado-123[FIRMADO].pdf',
              modifiedTime: '2026-07-13T10:00:00.000Z',
            },
          ],
        },
      });

    const result = await service.findSignedVersion(
      'original-id',
      undefined,
      'period-folder',
    );

    expect(result.signedFile.id).toBe('signed-id');
    expect(driveClient.files.list).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        q: expect.stringContaining("'period-folder' in parents"),
      }),
    );
  });

  it('moves a signed certificate to the supplied period folder', async () => {
    driveClient.files.get.mockResolvedValue({
      data: {
        id: 'signed-id',
        name: 'certificado-123[FIRMADO].pdf',
        parents: ['source-folder'],
      },
    });
    driveClient.files.update.mockResolvedValue({
      data: {
        id: 'signed-id',
        name: 'certificado-123[FIRMADO].pdf',
      },
    });

    await service.moveFileToRepository('signed-id', 'period-folder');

    expect(driveClient.files.update).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'signed-id',
        addParents: 'period-folder',
        removeParents: 'source-folder',
        supportsAllDrives: true,
      }),
    );
  });

  it('sends the original file to the trash', async () => {
    driveClient.files.get.mockResolvedValue({
      data: { id: 'original-id', trashed: false },
    });
    driveClient.files.update.mockResolvedValue({
      data: { id: 'original-id', trashed: true },
    });

    await service.trashFile('original-id');

    expect(driveClient.files.update).toHaveBeenCalledWith({
      fileId: 'original-id',
      supportsAllDrives: true,
      requestBody: { trashed: true },
      fields: 'id, trashed',
    });
  });

  it('does not trash an original file twice', async () => {
    driveClient.files.get.mockResolvedValue({
      data: { id: 'original-id', trashed: true },
    });

    await service.trashFile('original-id');

    expect(driveClient.files.update).not.toHaveBeenCalled();
  });
});
