const { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand } = require("@aws-sdk/client-s3");
const { ENDPOINT_S3, KEY_ID, APP_KEY, BUCKET, REGION, ENDPOINT } = process.env;

const s3Client = new S3Client({
  endpoint:ENDPOINT_S3,
  region: REGION,
  credentials: {
    accessKeyId: KEY_ID,
    secretAccessKey: APP_KEY,
  },
});

const uploadImagem = async (path, buffer, mimetype) => {
  try {

    //await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));

    const imagem = await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: path,
      Body: buffer,
      ContentType: mimetype
    }));
    return {
      url: `https://${BUCKET}.${ENDPOINT}/${path}`,
    };
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error("Erro ao fazer upload da imagem");
  }
};

const deleteImagem = async (url) => {
  try {

    const path = url.match(/[^/]+\/[^/]+\/[^/]+$/);
  
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: path[0]
    }));
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    throw new Error("Erro ao excluir imagem");
  }
};

module.exports = {
  uploadImagem,
  deleteImagem
};