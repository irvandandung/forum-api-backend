const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  it('should response 201 and new thread', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const requestAddThread = {
      title: 'sebuah thread',
      body: 'body sebuah thread',
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
    // Assert
    const responseJsonThread = JSON.parse(responseAddThread.payload);
    expect(responseAddThread.statusCode).toEqual(201);
    expect(responseJsonThread.status).toEqual('success');
    expect(responseJsonThread.data.addedThread).toBeDefined();
    expect(responseJsonThread.data.addedThread.title).toEqual(requestAddThread.title);
  });

  it('should response 400 when prop does not exist', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const requestAddThread = {
      body: 'body sebuah thread',
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
    // Assert
    const responseJsonThread = JSON.parse(responseAddThread.payload);
    expect(responseAddThread.statusCode).toEqual(400);
    expect(responseJsonThread.status).toEqual('fail');
    expect(responseJsonThread.message).toBeDefined();
    expect(responseJsonThread.message).toEqual('menambahkan thread gagal karena properti yang dibutuhkan tidak ada');
  });

  it('should response 200 when get detail thread', async () => {
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
    JSON.parse(responseAddComment.payload);
    const responseAddComment2 = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestAddComment,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const responseJsonComment2 = JSON.parse(responseAddComment2.payload);
    const commentId = responseJsonComment2.data.addedComment.id;
    await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: { Authorization: `Bearer ${responseJson.data.accessToken}` },
    });
    const getDetailThread = await server.inject({
      method: 'GET',
      url: `/threads/${threadId}`,
    });
    const responseJsonGetDetailThread = JSON.parse(getDetailThread.payload);

    // Assert
    expect(responseJsonGetDetailThread.data.thread).toBeDefined();
    expect(responseJsonGetDetailThread.data.thread.comments).toHaveLength(2);
    expect(responseJsonGetDetailThread.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
  });
});
