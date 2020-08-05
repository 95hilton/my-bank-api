import express from 'express';
const router = express.Router();
import { promises as fs, write } from 'fs';
import { loggers } from 'winston';

const { readFile, writeFile } = fs;

router.post('/', async (req, res, next) => {
  try {
    let account = req.body;

    if (!account.balance || account.balance == null) {
      throw new Error('Name e Balance obrigatorios');
    }

    const data = JSON.parse(await readFile(global.fileName));
    account = {
      id: data.nextId++,
      name: account.name,
      balance: account.balance,
    };

    data.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(data));
    res.send(account);
    logger.info(`post /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }

  res.end();
});

router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
    logger.info('get /account');
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      (account) => account.id == req.params.id
    );
    res.send(account);
    logger.info('get/ account/id:');
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts.filter((account) => account.id == req.params.id);
    await writeFile(fileName, JSON.stringify(data, null, 2));
    res.end();
    logger.info(`delete /account/:id - ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    let account = req.body;

    if (!account.balance || account.balance == null) {
      throw new Error('Name e Balance obrigatorios');
    }

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex((a) => a.id == account.id);
    if (index == -1) {
      throw new Error('registro não encontrado');
    }
    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(account);
    logger.info(`put /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.patch('/updateBalance', async (req, res, next) => {
  try {
    let account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex((a) => a.id == account.id);
    if (!account.id || account.balance == null) {
      throw new Error('ID e Balance obrigatorios');
    }

    if (index == -1) {
      throw new Error('registro não encontrado');
    }
    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(data.accounts[index]);
    logger.info(`patch /account/updateBalance - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.mesage}`);
  res.status(400).send({ error: err.mesage });
});

export default router;
