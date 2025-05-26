import { NextResponse } from 'next/server';
import {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteBucketCommand,
    paginateListObjectsV2,
    GetObjectCommand,
  } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({});



