/* eslint-disable camelcase */
class ListComment {
  constructor({
    id,
    content,
    username,
    created_at,
    is_delete,
  }) {
    this.id = id;
    this.username = username;
    this.date = created_at;
    this.content = (!is_delete) ? content : '**komentar telah dihapus**';
  }
}

module.exports = ListComment;
