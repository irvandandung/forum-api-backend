class DetailThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    await this._threadRepository.verifyAvailableIdThread(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    const thread = await this._threadRepository.getDetailThread(id);
    return { ...thread, comments };
  }
}

module.exports = DetailThreadUseCase;
