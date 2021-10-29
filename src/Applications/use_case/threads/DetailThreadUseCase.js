class DetailThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    await this._threadRepository.verifyAvailableIdThread(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    return this._threadRepository.getDetailThread(id, comments);
  }
}

module.exports = DetailThreadUseCase;
