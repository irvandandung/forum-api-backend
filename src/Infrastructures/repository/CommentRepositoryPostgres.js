const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ListComment = require('../../Domains/comments/entities/ListComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, thread, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, owner, thread, createdAt, createdAt],
    };
    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyAvailableIdComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('id comment tidak ditemukan');
    }
  }

  async deleteComment(id) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE comments SET is_delete = true, updated_at = $2 WHERE id = $1',
      values: [id, updatedAt],
    };

    await this._pool.query(query);
  }

  async isTrueOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows[0].owner !== owner) throw new AuthorizationError('akses dilarang!');
  }

  async getCommentsByThreadId(thread) {
    const query = {
      text: 'SELECT a.*, b.username FROM comments a JOIN users b ON a.owner = b.id WHERE a.thread = $1 ORDER BY a.created_at ASC',
      values: [thread],
    };

    const result = await this._pool.query(query);
    const comments = result.rows.map((comment) => new ListComment(comment));
    return comments;
  }
}

module.exports = CommentRepositoryPostgres;
