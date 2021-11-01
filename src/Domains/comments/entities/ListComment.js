/* eslint-disable camelcase */
class ListComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      content,
      username,
      created_at,
      is_delete,
    } = payload;
    this.id = id;
    this.username = username;
    this.date = created_at;
    this.content = (!is_delete) ? content : '**komentar telah dihapus**';
  }

  _verifyPayload({
    id,
    content,
    username,
    created_at,
    is_delete,
  }) {
    if (!id || !content || !username || !created_at || is_delete === undefined) throw new Error('LIST_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    if (
      typeof id !== 'string'
      || typeof content !== 'string'
      || typeof created_at !== 'string'
      || typeof is_delete !== 'boolean'
    ) throw new Error('LIST_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  }
}

module.exports = ListComment;
