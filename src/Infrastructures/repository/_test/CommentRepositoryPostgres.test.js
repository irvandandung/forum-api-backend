const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persis add comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const addComment = new AddComment({
        content: 'sebuah comment',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(addComment);
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return add comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const addComment = new AddComment({
        content: 'sebuah comment',
        thread: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
      }));
    });
  });

  describe('function getCommentsByThreadId', () => {
    it('should persis get comments correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const payloadComment1 = {
        id: 'comment-123',
        thread: 'thread-123',
        isDelete: false,
        content: 'comment sebuah thread',
        createdAt: '2021-08-08T07:19:09.775Z',
        owner: 'user-123',
      };
      const payloadComment2 = {
        thread: 'thread-123',
        isDelete: true,
        createdAt: '2021-08-09T07:19:09.775Z',
        id: 'comment-223',
        owner: 'user-123',
      };
      await CommentsTableHelper.addComment(payloadComment1);
      await CommentsTableHelper.addComment(payloadComment2);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(payloadComment1.id);
      expect(comments[0].date).toEqual(payloadComment1.createdAt);
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual(payloadComment1.content);
      expect(comments[1].id).toEqual(payloadComment2.id);
      expect(comments[1].date).toEqual(payloadComment2.createdAt);
      expect(comments[1].username).toEqual('dicoding');
      expect(comments[1].content).toEqual('**komentar telah dihapus**');
    });
  });

  describe('function verifyAvailableIdComment', () => {
    it('should not throw NotFoundError when id exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' }); // memasukan comment baru dengan id comment-123
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableIdComment('comment-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when id not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableIdComment('comment-123')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('function deletComment', () => {
    it('should delete Comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const data = { id: 'comment-123' };
      await CommentsTableHelper.addComment(data);

      // Action
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      commentRepositoryPostgres.deleteComment(data.id);
      const comments = await CommentsTableTestHelper.findCommentsById(data.id);

      // Arrange
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('function isTrueOwner', () => {
    it('should throw error Authorization when is not valid owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const data = { id: 'comment-123', owner: 'user-123' };
      const id = 'comment-123';
      const owner = 'user-222';
      await CommentsTableHelper.addComment(data);

      // Action
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Assert
      expect(commentRepositoryPostgres.isTrueOwner(id, owner))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error Authorization when is valid owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const data = { id: 'comment-123', owner: 'user-123' };
      const id = 'comment-123';
      const { owner } = data;
      await CommentsTableHelper.addComment(data);

      // Action
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Assert
      expect(commentRepositoryPostgres.isTrueOwner(id, owner))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });
});
