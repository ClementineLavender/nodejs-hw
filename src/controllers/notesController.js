import createError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = '1', perPage = '10', tag, search } = req.query;

    const currentPage = Number(page);
    const limit = Number(perPage);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      throw createError(400, 'Invalid page or perPage');
    }

    const skip = (currentPage - 1) * limit;

    const filter = {};
    if (tag) {
      filter.tag = tag;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).skip(skip).limit(limit),
      Note.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
      page: currentPage,
      perPage: limit,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      throw createError(404, 'Note not found');
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};
