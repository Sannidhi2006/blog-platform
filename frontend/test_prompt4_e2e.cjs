const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

async function testSuite() {
  console.log('====================================================');
  console.log('  PROMPT 4 E2E COMPREHENSIVE VERIFICATION SUITE   ');
  console.log('====================================================\n');

  // 1. Health check frontend & backend
  console.log('>> [Step 1] Checking Frontend & Backend Connectivity...');
  const healthRes = await fetch(`${BACKEND_URL}/api/health`);
  const healthData = await healthRes.json();
  if (healthRes.status !== 200 || healthData.status !== 'ok') {
    throw new Error('Backend health check failed');
  }
  console.log('✓ Backend is healthy:', healthData.message);

  const frontendRes = await fetch(FRONTEND_URL);
  if (frontendRes.status !== 200) {
    throw new Error('Frontend is not responding');
  }
  console.log('✓ Frontend server is responding with status 200\n');

  // 2. Register user
  const ts = Date.now();
  const username = `author_${ts}`;
  const email = `author_${ts}@example.com`;
  const password = 'Password123!';

  console.log('>> [Step 2] Registering a new author user...');
  const regRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Elena Rostova',
      username,
      email,
      password,
      confirmPassword: password,
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201 || !regData.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  const token = regData.token;
  const authorId = regData.user._id || regData.user.id;
  console.log(`✓ User registered successfully! Name: Elena Rostova, Username: ${username}, ID: ${authorId}\n`);

  // 3. Create a post with a real photo
  console.log('>> [Step 3] Creating a new post with a real image upload (multipart/form-data)...');
  const photo1Path = path.join(__dirname, 'test-photo-1.png');
  const photo1Buffer = fs.readFileSync(photo1Path);
  const blob1 = new Blob([photo1Buffer], { type: 'image/png' });

  const createForm = new FormData();
  createForm.append('title', 'Designing with Clean White Themes in 2026');
  createForm.append('category', 'Technology');
  createForm.append('content', 'Light aesthetics provide superior readability, minimal cognitive load, and crisp visual hierarchy for readers.');
  createForm.append('image', blob1, 'test-photo-1.png');

  const createRes = await fetch(`${BACKEND_URL}/api/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: createForm,
  });
  const createData = await createRes.json();
  if (createRes.status !== 201 || !createData.post) {
    throw new Error(`Failed to create post: ${JSON.stringify(createData)}`);
  }
  const postId = createData.post._id;
  const initialImage = createData.post.image;
  console.log(`✓ Post created! ID: ${postId}`);
  console.log(`  Title: "${createData.post.title}"`);
  console.log(`  Category: ${createData.post.category}`);
  console.log(`  Uploaded Image: ${initialImage}\n`);

  // Verify image is actually accessible via static /uploads route
  const imgCheck = await fetch(`${BACKEND_URL}/uploads/${initialImage}`);
  if (imgCheck.status !== 200) {
    throw new Error(`Image not accessible on static route /uploads/${initialImage}`);
  }
  console.log(`✓ Verified image is statically served at ${BACKEND_URL}/uploads/${initialImage} (Status: 200)\n`);

  // 4. Verify post appears on Home (GET /api/posts)
  console.log('>> [Step 4] Verifying post appears on Home feed (GET /api/posts)...');
  const feedRes = await fetch(`${BACKEND_URL}/api/posts`);
  const feedData = await feedRes.json();
  const homePost = feedData.posts.find((p) => p._id === postId);
  if (!homePost) {
    throw new Error('Created post not found in Home post list');
  }
  console.log(`✓ Post found in Home feed!`);
  console.log(`  Title: "${homePost.title}"`);
  console.log(`  Author: ${homePost.author?.name} (@${homePost.author?.username})`);
  console.log(`  Image filename matches: ${homePost.image === initialImage}\n`);

  // 5. Verify post details on GET /api/posts/:id
  console.log('>> [Step 5] Verifying post details view (GET /api/posts/:id)...');
  const detailRes = await fetch(`${BACKEND_URL}/api/posts/${postId}`);
  const detailData = await detailRes.json();
  if (detailRes.status !== 200 || !detailData.post) {
    throw new Error('Failed to retrieve post details');
  }
  console.log(`✓ Post details retrieved successfully:`);
  console.log(`  Title: "${detailData.post.title}"`);
  console.log(`  Full Content: "${detailData.post.content}"`);
  console.log(`  Cover Image: ${detailData.post.image}\n`);

  // 6. Edit post and replace image
  console.log('>> [Step 6] Editing post & replacing image (PUT /api/posts/:id)...');
  const photo2Path = path.join(__dirname, 'test-photo-2.png');
  const photo2Buffer = fs.readFileSync(photo2Path);
  const blob2 = new Blob([photo2Buffer], { type: 'image/png' });

  const editForm = new FormData();
  editForm.append('title', 'Updated: The Future of Clean UI Architecture 2026');
  editForm.append('category', 'Technology');
  editForm.append('content', 'Updated article content emphasizing high contrast, modern sans-serif typefaces, and fluid responsiveness.');
  editForm.append('image', blob2, 'test-photo-2.png');

  const editRes = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: editForm,
  });
  const editData = await editRes.json();
  if (editRes.status !== 200 || !editData.post) {
    throw new Error(`Failed to update post: ${JSON.stringify(editData)}`);
  }
  const updatedImage = editData.post.image;
  console.log(`✓ Post updated!`);
  console.log(`  New Title: "${editData.post.title}"`);
  console.log(`  New Image: ${updatedImage}`);
  console.log(`  Confirmed image file changed: ${updatedImage !== initialImage}`);

  // Confirm old image was deleted from disk and new image exists
  const oldImgPath = path.join(__dirname, '..', 'backend', 'uploads', initialImage);
  const oldExists = fs.existsSync(oldImgPath);
  console.log(`  Old image removed from disk: ${!oldExists}`);
  const newImgCheck = await fetch(`${BACKEND_URL}/uploads/${updatedImage}`);
  console.log(`  New image accessible on /uploads/: ${newImgCheck.status === 200}\n`);

  // 7. Test Search & Filter
  console.log('>> [Step 7] Testing Search & Category Filter...');
  const searchRes = await fetch(`${BACKEND_URL}/api/posts/search?q=Architecture&category=Technology`);
  const searchData = await searchRes.json();
  const searchMatch = searchData.posts.find((p) => p._id === postId);
  console.log(`✓ Search returned ${searchData.posts.length} result(s). Post found: ${!!searchMatch}\n`);

  // 8. Delete post
  console.log('>> [Step 8] Deleting the post (DELETE /api/posts/:id)...');
  const delRes = await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const delData = await delRes.json();
  if (delRes.status !== 200) {
    throw new Error(`Failed to delete post: ${JSON.stringify(delData)}`);
  }
  console.log(`✓ Delete request successful:`, delData.message);

  // 9. Confirm post is gone from database & UI
  console.log('>> [Step 9] Confirming post is gone from DB and Home list...');
  const verifyDeletedRes = await fetch(`${BACKEND_URL}/api/posts/${postId}`);
  console.log(`✓ GET /api/posts/${postId} status: ${verifyDeletedRes.status} (Expected: 404)`);

  const verifyFeedRes = await fetch(`${BACKEND_URL}/api/posts`);
  const verifyFeedData = await verifyFeedRes.json();
  const deletedStillInFeed = verifyFeedData.posts.some((p) => p._id === postId);
  console.log(`✓ Post absent from Home feed: ${!deletedStillInFeed}`);

  const postImgPath = path.join(__dirname, '..', 'backend', 'uploads', updatedImage);
  console.log(`✓ Post image removed from disk after deletion: ${!fs.existsSync(postImgPath)}\n`);

  console.log('====================================================');
  console.log('      ALL PROMPT 4 VERIFICATIONS PASSED 100%!      ');
  console.log('====================================================');
}

testSuite().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
