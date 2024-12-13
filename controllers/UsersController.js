/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const queueUser = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const pwd = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!pwd) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const usr = await (await dbClient.usersCollection()).findOne({ email });

    if (usr) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const usrId = insertionInfo.insertedId.toString();

    queueUser.add({ userId });
    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
    const { user } = req;
    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
