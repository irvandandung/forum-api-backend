const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint with add & delete comment', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  it('should response 201 and new comments', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const requestAddThread = {
      title: 'sebuah thread',
      body: 'body sebuah thread',
    };

    const requestAddComment = {
      content: 'sebuah content',
    };

    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Action
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });
    const responseJson = JSON.parse(responseAuth.payload);
    const responseAddThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestAddThread,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonThread = JSON.parse(responseAddThread.payload);
    const threadId = responseJsonThread.data.addedThread.id;
    const responseAddComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestAddComment,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonComment = JSON.parse(responseAddComment.payload);

    // Assert
    expect(responseAddComment.statusCode).toEqual(201);
    expect(responseJsonComment.status).toEqual('success');
    expect(responseJsonComment.data.addedComment).toBeDefined();
    expect(responseJsonComment.data.addedComment.content).toEqual(requestAddComment.content);
  });

  it('should response 400 when prop does not exist in new comment', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const requestAddThread = {
      title: 'sebuah thread',
      body: 'body sebuah thread',
    };

    const requestAddComment = {
    };

    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Action
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });
    const responseJson = JSON.parse(responseAuth.payload);
    const responseAddThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestAddThread,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonThread = JSON.parse(responseAddThread.payload);
    const threadId = responseJsonThread.data.addedThread.id;
    const responseAddComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestAddComment,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonComment = JSON.parse(responseAddComment.payload);

    // Assert
    expect(responseAddComment.statusCode).toEqual(400);
    expect(responseJsonComment.status).toEqual('fail');
    expect(responseJsonComment.message).toBeDefined();
    expect(responseJsonComment.message).toEqual('menambahkan comment gagal karena properti yang dibutuhkan tidak ada');
  });

  it('should response 404 threadId not exist in new comment', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const requestAddThread = {
      title: 'sebuah thread',
      body: 'body sebuah thread',
    };

    const requestAddComment = {
      content: 'sebuah content',
    };

    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Action
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });
    const responseJson = JSON.parse(responseAuth.payload);
    const threadId = 'thread-123';
    const responseAddComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestAddComment,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonComment = JSON.parse(responseAddComment.payload);

    // Assert
    expect(responseAddComment.statusCode).toEqual(404);
    expect(responseJsonComment.status).toEqual('fail');
    expect(responseJsonComment.message).toBeDefined();
    expect(responseJsonComment.message).toEqual('id thread tidak ditemukan');
  });

  it('should response 200 when delete comment correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const requestAddThread = {
      title: 'sebuah thread',
      body: 'body sebuah thread',
    };

    const requestAddComment = {
      content: 'sebuah content',
    };

    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // Action
    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });
    const responseJson = JSON.parse(responseAuth.payload);
    const responseAddThread = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestAddThread,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonThread = JSON.parse(responseAddThread.payload);
    const threadId = responseJsonThread.data.addedThread.id;

    const responseAddComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestAddComment,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonComment = JSON.parse(responseAddComment.payload);
    const commentId = responseJsonComment.data.addedComment.id;

    const responseDeleteComment = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });

    // Assert
    expect(responseDeleteComment.statusCode).toEqual(200);
  });
});
