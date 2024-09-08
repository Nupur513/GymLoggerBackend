import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function getObjectUrl(key){
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'uploads/displaypictures/' + key,
    };
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command);
    return url;
}

export async function uploadObject(filename){
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'uploads/displaypictures/' + filename,
        ContentType: 'image/jpeg',
    };
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, command);
    return url;
}

export async function listObjects(){
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
    };
    const data = await s3Client.send(new ListObjectsCommand(params));
    return data;
}

export { s3Client };

