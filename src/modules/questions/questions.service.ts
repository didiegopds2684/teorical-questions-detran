import { HttpError } from "../../common/http-error.js";
import type { ListFilters, QuestionsRepository } from "./questions.repository.js";
import type { ModuleSummary, Paginated, Question } from "./question.types.js";

export class QuestionsService {
  constructor(private readonly repo: QuestionsRepository) {}

  async getById(id: string): Promise<Question> {
    const q = await this.repo.findById(id);
    if (!q) {
      throw new HttpError(404, "NOT_FOUND", `Question not found: ${id}`);
    }
    return q;
  }

  async list(
    filters: ListFilters,
    page: number,
    limit: number,
  ): Promise<Paginated<Question>> {
    return this.repo.list(filters, page, limit);
  }

  async random(filters: ListFilters): Promise<Question> {
    const q = await this.repo.randomOne(filters);
    if (!q) {
      throw new HttpError(404, "NOT_FOUND", "No question matches the given filters");
    }
    return q;
  }

  async modules(): Promise<ModuleSummary[]> {
    return this.repo.listModules();
  }

  async upsert(question: Question): Promise<Question> {
    return this.repo.upsert(question);
  }

  async deleteById(id: string): Promise<boolean> {
    return this.repo.deleteById(id);
  }

  async importMany(questions: Question[]): Promise<{ imported: number }> {
    for (const q of questions) {
      await this.repo.upsert(q);
    }
    return { imported: questions.length };
  }
}
