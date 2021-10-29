/* eslint-disable camelcase */
class DetailThread {
  constructor({
    id,
    title,
    body,
    created_at,
    username,
    comments,
  }) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.date = created_at;
    this.username = username;
    this.comments = comments;
  }
}

module.exports = DetailThread;
