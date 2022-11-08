const express = require('express');
const router = express.Router();
const Note = require('../models/Note.js')
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');


// get all the notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        // res.statues(500).send("some error accured")
    }
})
// add a nw notes
router.post('/addnotes', fetchuser, [
    body('title').isLength({ min: 3 }),
    body('description').isLength({ min: 5 }),
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()

        res.json(savedNote)
    } catch (error) {
        console.error(error.message)
         res.statues(500).send("some error accured")
    }
})


// update an existing note

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message)
        // res.statues(500).send("some error accured")
    }
})

// delete an existing note

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Sucess": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message)
        // res.statues(500).send("some error accured")
    }
})
module.exports = router