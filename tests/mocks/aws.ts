// Mock AWS SDK for testing

export const mockS3Client = {
  send: jest.fn(),
  config: {
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
    },
  },
}

export const mockS3Commands = {
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
  HeadObjectCommand: jest.fn(),
}

// Mock AWS SDK v3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => mockS3Client),
  ...mockS3Commands,
}))

// Mock AWS SDK v2 (if still used)
const mockAWS = {
  config: {
    update: jest.fn(),
  },
  S3: jest.fn(() => ({
    getObject: jest.fn(),
    putObject: jest.fn(),
    deleteObject: jest.fn(),
    listObjectsV2: jest.fn(),
    headObject: jest.fn(),
  })),
}

jest.mock('aws-sdk', () => mockAWS)

// Helper functions for test setup
export const mockS3Operations = {
  mockGetObjectSuccess: (data: any) => {
    mockS3Client.send.mockResolvedValue({
      Body: {
        transformToString: () => Promise.resolve(JSON.stringify(data)),
        transformToByteArray: () => Promise.resolve(new Uint8Array()),
      },
      ContentType: 'application/json',
      ContentLength: JSON.stringify(data).length,
    })
  },
  
  mockGetObjectError: (error: string) => {
    mockS3Client.send.mockRejectedValue(new Error(error))
  },
  
  mockPutObjectSuccess: () => {
    mockS3Client.send.mockResolvedValue({
      ETag: '"mock-etag"',
      Location: 'https://bucket.s3.amazonaws.com/key',
      Bucket: 'test-bucket',
      Key: 'test-key',
    })
  },
  
  mockPutObjectError: (error: string) => {
    mockS3Client.send.mockRejectedValue(new Error(error))
  },
  
  mockDeleteObjectSuccess: () => {
    mockS3Client.send.mockResolvedValue({
      DeleteMarker: false,
      VersionId: 'mock-version-id',
    })
  },
  
  mockListObjectsSuccess: (objects: any[] = []) => {
    mockS3Client.send.mockResolvedValue({
      Contents: objects.map((obj, index) => ({
        Key: obj.key || `object-${index}`,
        LastModified: new Date(),
        ETag: `"etag-${index}"`,
        Size: obj.size || 1024,
        StorageClass: 'STANDARD',
        ...obj,
      })),
      IsTruncated: false,
      MaxKeys: 1000,
      Name: 'test-bucket',
    })
  },
  
  reset: () => {
    mockS3Client.send.mockReset()
    Object.values(mockS3Commands).forEach((mock: any) => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset()
      }
    })
  },
}