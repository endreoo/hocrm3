import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/api';
import type { User, CreateUserInput, UpdateUserInput } from '../../types';

interface UserModalProps {
  user: User | null;
  isCreating?: boolean;
  onClose: () => void;
}

export default function UserModal({ user, isCreating = false, onClose }: UserModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserInput | UpdateUserInput>(() => {
    if (isCreating) {
      return {
        username: '',
        email: '',
        password: '',
        role: 'user',
        job_title: ''
      };
    }
    return {
      username: user?.username || '',
      email: user?.email || '',
      role: user?.role || 'user',
      job_title: user?.job_title || ''
    };
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: (updatedUser: UpdateUserInput) => 
      userService.updateUser(user!.id, updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const { mutate: createUser, isPending: isCreatingUser } = useMutation({
    mutationFn: (newUser: CreateUserInput) => 
      userService.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const { mutate: approveUser, isPending: isApproving } = useMutation({
    mutationFn: () => userService.approveUser(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const { mutate: resetPassword, isPending: isResetting } = useMutation({
    mutationFn: () => userService.resetPassword(user!.id),
    onSuccess: () => {
      onClose();
    },
  });

  const isLoading = isUpdating || isCreatingUser || isApproving || isResetting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      createUser(formData as CreateUserInput);
    } else if (user) {
      updateUser(formData as UpdateUserInput);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Transition.Root show as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit}>
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        {isCreating ? 'Create New User' : 'Edit User'}
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-left">
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        {isCreating && (
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
                              Password
                            </label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              value={(formData as CreateUserInput).password}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        )}
                        <div>
                          <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 text-left">
                            Job Title
                          </label>
                          <input
                            type="text"
                            name="job_title"
                            id="job_title"
                            value={formData.job_title}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 text-left">
                            Role
                          </label>
                          <select
                            name="role"
                            id="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    >
                      {isLoading ? 'Processing...' : isCreating ? 'Create' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                {!isCreating && user && !user.is_approved && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => approveUser()}
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                    >
                      {isApproving ? 'Approving...' : 'Approve User'}
                    </button>
                  </div>
                )}
                {!isCreating && user && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => resetPassword()}
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500"
                    >
                      {isResetting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}