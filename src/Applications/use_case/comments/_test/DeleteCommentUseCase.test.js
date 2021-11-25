const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('it should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      id: 'comment-123',
      owner: 'user-123',
      thread: 'thread-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableIdThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableIdComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.isTrueOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn().mockImplementation(
      () => Promise.resolve(),
    );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteCommentUseCase.execute(useCasePayload))
      .resolves.not.toThrowError(Error);

    expect(mockThreadRepository.verifyAvailableIdThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.verifyAvailableIdComment).toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.isTrueOwner).toBeCalledWith(
      useCasePayload.id,
      useCasePayload.owner,
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload.id);
  });
});
