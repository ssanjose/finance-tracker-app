import FinanceTrackerDatabase, { Account } from '@/lib/db/db.model';
import { useLiveQuery } from 'dexie-react-hooks';

/**
 * Creates a new account.
 *
 * @param {Account} account - The account object to create.
 * @returns {Promise<number>} - A promise that resolves to the ID of the created account.
 */
function createAccount(account: Account): Promise<number> {
  return FinanceTrackerDatabase.transaction('rw', FinanceTrackerDatabase.accounts, async () => {
    return await FinanceTrackerDatabase.accounts.add(account) as number;
  });
}

/**
 * Gets an account by ID.
 *
 * @param {number} id - The ID of the account to retrieve.
 * @returns {Promise<Account | undefined>} - A promise that resolves to the account object or undefined if not found.
 */
function getAccount(id: number) {
  return FinanceTrackerDatabase.transaction('r', FinanceTrackerDatabase.accounts, async () => {
    return await FinanceTrackerDatabase.accounts.get(id);
  });
}

/**
 * Gets all accounts.
 *
 * @returns {Promise<Account[]>} - A promise that resolves to an array of all account objects.
 */
function getAllAccounts() {
  return FinanceTrackerDatabase.transaction('r', FinanceTrackerDatabase.accounts, async () => {
    let accounts = await FinanceTrackerDatabase.accounts.toArray();
    if (!accounts) {
      accounts = [];
    }
    return accounts;
  });
}

/**
 * Updates an account by ID.
 *
 * @param {number} id - The ID of the account to update.
 * @param {Partial<Account>} updatedAccount - The updated account object.
 * @returns {Promise<number>} - A promise that resolves to the number of updated records.
 */
function updateAccount(id: number, updatedAccount: Partial<Account>): Promise<number> {
  return FinanceTrackerDatabase.transaction('rw', FinanceTrackerDatabase.accounts, async () => {
    return await FinanceTrackerDatabase.accounts.update(id, updatedAccount);
  });
}

/**
 * Deletes an account by ID, including all related transactions and applied transactions.
 *
 * @param {number} id - The ID of the account to delete.
 * @returns {Promise<void>} - A promise that resolves when the account and related records are deleted.
 */
function deleteAccount(id: number): Promise<void> {
  return FinanceTrackerDatabase.transaction('rw', FinanceTrackerDatabase.accounts, FinanceTrackerDatabase.transactions, FinanceTrackerDatabase.appliedTransactions, async () => {
    const transactions = await FinanceTrackerDatabase.transactions.where({ accountId: id }).toArray();

    for (const transaction of transactions) {
      await FinanceTrackerDatabase.appliedTransactions.where({ transactionId: transaction.id }).delete();
    }

    await FinanceTrackerDatabase.transactions.bulkDelete(transactions.map(transaction => transaction.id));
    await FinanceTrackerDatabase.accounts.delete(id);
  })
    .catch(error => {
      console.error(error);
    });
}

export const AccountController = {
  createAccount,
  getAccount,
  getAllAccounts,
  updateAccount,
  deleteAccount,
};