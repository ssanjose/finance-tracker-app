'use client';

import React from 'react';
import { AccountForm } from '@/components/account/AccountForm';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import { DrawerDialog } from '@/components/shared/ResponsiveDrawerDialog';
import { useDialog } from '@/hooks/use-dialog';
import { Account } from '@/lib/db/db.model';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { AccountService } from '@/services/account.service';
import { Sleep } from '@/lib/utils';

interface AccountButtonProps {
  button?: React.ReactNode;
  dialogProps?: typeof useDialog;
  title?: string;
  description?: string;
}

interface EditAccountButtonProps extends AccountButtonProps {
  existingAccount: Account;
}

interface DeleteAccountButtonProps extends AccountButtonProps {
  id?: number;
}

/**
 * Opens a dialog to create a new account
 * @param {React.ReactNode} button - The button to render
 * @param {typeof useDialog} dialogProps - The dialog props
 * @param {string} title - The title of the dialog
 * @param {string} description - The description of the dialog
 */
const OpenAccountButton = ({ button, dialogProps, title, description }: AccountButtonProps) => {
  const openAccountDialog = dialogProps ? dialogProps() : useDialog();
  const buttonChildren = button || (
    <Button variant="link" size="icon" className="p-none w-min">
      <span>Create a new Account</span>
      <CirclePlus />
    </Button>
  );

  return (
    <DrawerDialog
      triggerButton={buttonChildren}
      title={title ? title : "Create a new Account"}
      description={description ? description : "You cannot adjust the balance of an account after it has been created."}
      dialog={openAccountDialog}
      footer={null}
      noX
    >
      <AccountForm onSave={openAccountDialog.dismiss} />
    </DrawerDialog>
  )
};

/**
 * Opens a dialog to edit an account
 * @param {React.ReactNode} button - The button to render
 * @param {typeof useDialog} dialogProps - The dialog props
 * @param {string} title - The title of the dialog
 * @param {string} description - The description of the dialog
 * @param {Account} existingAccount - The existing account to edit
 */
const EditAccountButton = ({ button, dialogProps, title, description, existingAccount }: EditAccountButtonProps) => {
  const editAccountDialog = dialogProps ? dialogProps() : useDialog();
  const buttonChildren = button || (
    <Button variant="ghost" size="icon" className="px-2 w-full flex justify-start" >
      <span>Edit an Account</span>
    </Button>
  );

  return (
    <DrawerDialog
      triggerButton={buttonChildren}
      title={title ? title : "Edit an Account"}
      description={description ? description : "You cannot adjust the balance of an account after it has been created."}
      dialog={editAccountDialog}
      footer={null}
      noX
    >
      <AccountForm onSave={editAccountDialog.dismiss} existingAccount={existingAccount} />
    </DrawerDialog>
  )
}

/**
 * Opens a dialog to delete an account
 * @param {number} id - The account id
 * @param {React.ReactNode} button - The button to render
 * @param {string} title - The title of the dialog
 * @param {string} description - The description of the dialog
 */
const DeleteAccountButton = ({ id, button, title, description }: DeleteAccountButtonProps) => {
  const router = useRouter();
  const buttonChildren = button || (
    <Button variant="ghost" size="icon" className="px-2 w-full flex justify-start" disabled={!id}>
      <span>Delete Account</span>
    </Button>
  );

  const handleDelete = async (id?: number) => {
    const getTransaction = async () => {
      if (id!)
        await AccountService.deleteAccount(id);
      await Sleep(500);
    }
    getTransaction();
    router.push('/overview');
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {buttonChildren}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            {title ? title : "Are you sure you want to delete this account?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {description ? description : "This action cannot be undone. This will permanently delete the account and all associated transactions."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDelete(id)}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { OpenAccountButton, EditAccountButton, DeleteAccountButton };