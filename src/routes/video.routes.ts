import express from 'express';
import { uploadVideo as uploadVideoMiddleware, handleUploadError } from '../middlewares/upload.middleware';
import { getVideo, listVideosHandler, uploadVideo } from '../controllers/video.controller';

const router = express.Router();

router.post('/', uploadVideoMiddleware, handleUploadError, uploadVideo);
router.get('/', listVideosHandler);
router.get('/:id', getVideo);

export default router;
