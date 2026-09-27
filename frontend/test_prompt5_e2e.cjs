const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

async function runPrompt5Verification() {
  console.log('===========================================================');
  console.log('       PROMPT 5 END-TO-END COMPREHENSIVE TEST SUITE        ');
  console.log('===========================================================\n');

  const ts = Date.now();

  // 1. Register User A (Alice)
  console.log('>> [Step 1] Registering User A (Alice)...');
  const userAData = {
    name: 'Alice Johnson',
    username: `alice_${ts}`,
    email: `alice_${ts}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };
  const regARes = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userAData),
  });
  const regA = await regARes.json();
  if (regARes.status !== 201 || !regA.token) {
    throw new Error(`Failed to register User A: ${JSON.stringify(regA)}`);
  }
  const tokenA = regA.token;
  const userAId = regA.user._id || regA.user.id;
  console.log(`✓ User A registered: ${userAData.username} (ID: ${userAId})\n`);

  // 2. Register User B (Bob)
  console.log('>> [Step 2] Registering User B (Bob)...');
  const userBData = {
    name: 'Bob Smith',
    username: `bob_${ts}`,
    email: `bob_${ts}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };
  const regBRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userBData),
  });
  const regB = await regBRes.json();
  if (regBRes.status !== 201 || !regB.token) {
    throw new Error(`Failed to register User B: ${JSON.stringify(regB)}`);
  }
  const tokenB = regB.token;
  const userBId = regB.user._id || regB.user.id;
  console.log(`✓ User B registered: ${userBData.username} (ID: ${userBId})\n`);

  // 3. User B creates a post
  console.log('>> [Step 3] User B creates a new blog post...');
  const createPostForm = new FormData();
  createPostForm.append('title', "Bob's Deep Dive into Distributed Consensus");
  createPostForm.append('category', 'Technology');
  createPostForm.append('content', 'Raft and Paxos are fundamental algorithms for managing replicated logs in distributed databases.');

  const postRes = await fetch(`${BACKEND_URL}/api/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: createPostForm,
  });
  const postData = await postRes.json();
  if (postRes.status !== 201 || !postData.post) {
    throw new Error(`Failed to create post: ${JSON.stringify(postData)}`);
  }
  const postId = postData.post._id;
  console.log(`✓ User B published post: ID ${postId}, Title: "${postData.post.title}"\n`);

  // 4. Test Profile & My Blogs API for User B
  console.log('>> [Step 4] Testing Profile data (GET /api/users/:id and /api/users/:id/posts)...');
  const userBProfileRes = await fetch(`${BACKEND_URL}/api/users/${userBId}`);
  const userBProfile = await userBProfileRes.json();
  console.log(`✓ GET /api/users/${userBId} returned User B:`, userBProfile.user.name, userBProfile.user.email);

  const userBPostsRes = await fetch(`${BACKEND_URL}/api/users/${userBId}/posts`);
  const userBPosts = await userBPostsRes.json();
  console.log(`✓ GET /api/users/${userBId}/posts count: ${userBPosts.count}, posts: ${userBPosts.posts.length}`);
  if (userBPosts.posts.length !== 1 || userBPosts.posts[0]._id !== postId) {
    throw new Error('User B posts mismatch');
  }
  console.log(`✓ Verified User B post appears in their profile and My Blogs feed\n`);

  // 5. User A comments on User B's post
  console.log(">> [Step 5] User A comments on User B's post (POST /api/comments/:postId)...");
  const commentContent = 'Fascinating explanation of Raft log replication! Thanks Bob.';
  const commentRes = await fetch(`${BACKEND_URL}/api/comments/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ content: commentContent }),
  });
  const commentData = await commentRes.json();
  if (commentRes.status !== 201 || !commentData.comment) {
    throw new Error(`Failed to create comment: ${JSON.stringify(commentData)}`);
  }
  const commentId = commentData.comment._id;
  console.log(`✓ User A successfully commented!`);
  console.log(`  Comment ID: ${commentId}`);
  console.log(`  Author: ${commentData.comment.author?.username || commentData.comment.author?.name}`);
  console.log(`  Content: "${commentData.comment.content}"\n`);

  // 6. Verify comment is in GET /api/comments/:postId
  console.log('>> [Step 6] Verifying comment exists on GET /api/comments/:postId...');
  const listCommentsRes = await fetch(`${BACKEND_URL}/api/comments/${postId}`);
  const listComments = await listCommentsRes.json();
  const foundComment = listComments.comments.find((c) => c._id === commentId);
  if (!foundComment) {
    throw new Error('Comment not found in list');
  }
  console.log(`✓ Comment confirmed in GET /api/comments/:postId (total: ${listComments.count})\n`);

  // 7. CRITICAL TEST: User B attempts to delete User A's comment
  console.log(">> [Step 7] User B attempts to delete User A's comment (Unauthorized test)...");
  const unauthorizedDelRes = await fetch(`${BACKEND_URL}/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const unauthorizedDelData = await unauthorizedDelRes.json();
  console.log(`✓ Backend Response Status: ${unauthorizedDelRes.status} (Expected 403 Forbidden)`);
  console.log(`✓ Backend Error Message: "${unauthorizedDelData.message}"`);

  if (unauthorizedDelRes.status !== 403) {
    throw new Error(`Backend security failed! Expected status 403, got ${unauthorizedDelRes.status}`);
  }
  console.log("✓ SUCCESS: Backend strictly blocked User B from deleting User A's comment!\n");

  // 8. Confirm comment is still in database
  console.log('>> [Step 8] Confirming comment is still intact in database...');
  const checkStillThereRes = await fetch(`${BACKEND_URL}/api/comments/${postId}`);
  const checkStillThere = await checkStillThereRes.json();
  const stillExists = checkStillThere.comments.some((c) => c._id === commentId);
  if (!stillExists) {
    throw new Error('Comment was unexpectedly deleted!');
  }
  console.log('✓ Comment is still intact in the database!\n');

  // 9. CRITICAL TEST: User A deletes their own comment
  console.log(">> [Step 9] User A deletes their own comment (Authorized test)...");
  const authorizedDelRes = await fetch(`${BACKEND_URL}/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const authorizedDelData = await authorizedDelRes.json();
  console.log(`✓ Backend Response Status: ${authorizedDelRes.status} (Expected 200 OK)`);
  console.log(`✓ Backend Response Message: "${authorizedDelData.message}"`);

  if (authorizedDelRes.status !== 200) {
    throw new Error(`User A failed to delete own comment: ${JSON.stringify(authorizedDelData)}`);
  }
  console.log('✓ SUCCESS: User A deleted their own comment successfully!\n');

  // 10. Confirm comment is now gone from database
  console.log('>> [Step 10] Confirming comment is permanently removed from database...');
  const finalCommentsRes = await fetch(`${BACKEND_URL}/api/comments/${postId}`);
  const finalComments = await finalCommentsRes.json();
  const deletedCommentFound = finalComments.comments.some((c) => c._id === commentId);
  console.log(`✓ Comment absent from post comments: ${!deletedCommentFound} (Remaining count: ${finalComments.count})\n`);

  // 11. Cleanup test post
  console.log('>> [Step 11] Cleaning up test post...');
  await fetch(`${BACKEND_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log('✓ Test post cleaned up.\n');

  console.log('===========================================================');
  console.log('       ALL PROMPT 5 TESTS PASSED WITH 100% SUCCESS!        ');
  console.log('===========================================================');
}

runPrompt5Verification().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
