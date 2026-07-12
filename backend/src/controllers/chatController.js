import Chat from '../models/Chat.js';

export const createChat = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let chat = await Chat.findOne({ user: req.user._id, status: 'open' });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        subject: subject || 'General Inquiry',
        messages: [{
          sender: 'customer',
          text: message.trim(),
        }],
      });
    } else {
      chat.messages.push({
        sender: 'customer',
        text: message.trim(),
      });
      chat.lastMessageAt = new Date();
      await chat.save();
    }

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id, status: 'open' });

    if (!chat) {
      return res.json(null);
    }

    chat.messages.forEach((msg) => {
      if (msg.sender === 'admin' && !msg.read) {
        msg.read = true;
      }
    });
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const chats = await Chat.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('user userName userEmail subject status lastMessageAt messages');

    const total = await Chat.countDocuments(filter);

    const chatsWithUnread = chats.map((chat) => {
      const unreadCount = chat.messages.filter(
        (msg) => msg.sender === 'customer' && !msg.read
      ).length;
      const lastMessage = chat.messages[chat.messages.length - 1]?.text || '';
      return {
        _id: chat._id,
        user: chat.user,
        userName: chat.userName,
        userEmail: chat.userEmail,
        subject: chat.subject,
        status: chat.status,
        lastMessageAt: chat.lastMessageAt,
        unreadCount,
        lastMessage,
      };
    });

    res.json({ chats: chatsWithUnread, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.forEach((msg) => {
      if (msg.sender === 'customer' && !msg.read) {
        msg.read = true;
      }
    });
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({
      sender: 'admin',
      text: message.trim(),
    });
    chat.lastMessageAt = new Date();
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const closeChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.status = 'closed';
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
