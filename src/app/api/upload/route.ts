import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';


var imagekit = new ImageKit({
  publicKey: "public_NetOtWjkDMfYM4o0cOMzvctgdnM=",
  privateKey: "private_VyYjzq4nkB6PZvlC2afj9bize3s=",
  urlEndpoint:
    "https://ik.imagekit.io/z0only1zm"
})


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const uploadResponse = await imagekit.upload({
      file: base64,
      fileName: file.name,
      folder: '/products', // optional
    });
    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload file to ImageKit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ success: false, message: 'No fileId provided' }, { status: 400 });
    }
    const deleteResponse = await imagekit.deleteFile(fileId);
    return NextResponse.json({ success: true, result: deleteResponse });
  } catch (error) {
    console.error('ImageKit delete error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete file from ImageKit' }, { status: 500 });
  }
} 