import { quotes, type Quote, type InsertQuote } from "@shared/schema";

export interface IStorage {
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: number): Promise<Quote | undefined>;
}

export class MemStorage implements IStorage {
  private quotes: Map<number, Quote>;
  private currentId: number;

  constructor() {
    this.quotes = new Map();
    this.currentId = 1;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = this.currentId++;
    const newQuote = { ...quote, id };
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }
}

export const storage = new MemStorage();
