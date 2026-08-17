const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const logger = require("../utils/logger");


// ===============================
// REQUIRED ENVIRONMENT VARIABLES
// ===============================

const requiredEnv = [
    "AWS_REGION",
    "AWS_S3_BUCKET_NAME"
];

const missing = requiredEnv.filter(
    (key) => !process.env[key]
);

if (missing.length > 0) {
    logger.error(
        `AWS S3 configuration failed. Missing: ${missing.join(", ")}`
    );
} else {
    logger.info(
        `AWS S3 configured successfully for bucket: ${process.env.AWS_S3_BUCKET_NAME}`
    );
}


// ===============================
// S3 CLIENT
// ===============================

// No accessKeyId or secretAccessKey here.
// When running on ECS/Fargate, AWS SDK automatically
// gets temporary credentials from the ECS Task Role.

const s3 = new S3Client({
    region: process.env.AWS_REGION
});


// ===============================
// UPLOAD FILE TO S3
// ===============================

const uploadToS3 = async ({
    key,
    buffer,
    contentType,
    originalFileName
}) => {

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ContentDisposition:
                `inline; filename="${originalFileName.replace(/"/g, "")}"`
        })
    );

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
};


// ===============================
// DELETE FILE FROM S3
// ===============================

const deleteFromS3 = async (key) => {

    if (!key) {
        return;
    }

    await s3.send(
        new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        })
    );
};


// ===============================
// GET SIGNED DOCUMENT URL
// ===============================

const getSignedDocumentUrl = async (key) => {

    if (!key) {
        return null;
    }

    return getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        }),
        {
            expiresIn: 60 * 15
        }
    );
};


// ===============================
// EXPORT
// ===============================

module.exports = {
    s3,
    uploadToS3,
    deleteFromS3,
    getSignedDocumentUrl
};