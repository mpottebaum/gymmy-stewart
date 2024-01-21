import { Form, FormProps } from '@remix-run/react'

type UserFormProps = {
  type: 'login' | 'register'
  onInputsChange: (value: string) => void
} & FormProps &
  React.RefAttributes<HTMLFormElement>

export function UserForm({
  type,
  onInputsChange,
  ...formProps
}: UserFormProps) {
  function onChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    onInputsChange(e.target.value)
  }
  return (
    <Form {...formProps}>
      <div className='flex w-full flex-col pb-4'>
        <label htmlFor='username' className='pb-1'>
          username
        </label>
        <input
          id='username'
          name='username'
          type='text'
          className='w-full rounded border border-blue-700 bg-blue-100 p-2'
          onChange={onChange}
        />
      </div>
      <div className='flex w-full flex-col pb-4'>
        <label htmlFor='password' className='pb-1'>
          password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          className='w-full rounded border border-blue-700 bg-blue-100 p-2'
          onChange={onChange}
        />
      </div>
      {type === 'register' && (
        <div className='flex w-full flex-col pb-4'>
          <label htmlFor='confirmPassword' className='pb-1'>
            confirm password
          </label>
          <input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            className='w-full rounded border border-blue-700 bg-blue-100 p-2'
            onChange={onChange}
          />
        </div>
      )}
      <button
        type='submit'
        className='rounded border border-blue-700 bg-orange-600 p-2 text-white'
      >
        {type === 'login' && 'log in'}
        {type === 'register' && 'sign up'}
      </button>
    </Form>
  )
}
