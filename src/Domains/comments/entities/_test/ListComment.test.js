const ListComment = require('../ListComment');

describe('a ListComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'sebuah thread',
    };

    // Action and Assert
    expect(() => new ListComment(payload)).toThrowError('LIST_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'sebuah thread',
      username: 123,
      created_at: 232,
      is_delete: 121,
    };

    // Action and Assert
    expect(() => new ListComment(payload)).toThrowError('LIST_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('must create ListComment object Correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment sebuah thread',
      username: 'dandung',
      is_delete: true,
      created_at: '2021-08-08T07:19:09.775Z',
    };

    // Action and Assert
    const {
      id, content, username, date,
    } = new ListComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.created_at);
    expect(content).toEqual('**komentar telah dihapus**');
  });

  it('must create ListComment object Correctly when is_delete is false', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'comment sebuah thread',
      username: 'dandung',
      is_delete: false,
      created_at: '2021-08-08T07:19:09.775Z',
    };

    // Action and Assert
    const {
      id, content, username, date,
    } = new ListComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.created_at);
    expect(content).toEqual(payload.content);
  });
});
