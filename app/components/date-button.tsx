type DateButtonProps = {
  date: number;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function DateButton({
  date,
  ...buttonProps
}: DateButtonProps) {
  return (
    <div className='flex items-center'>
      <button {...buttonProps} className='w-full p-2'>
        {date}
      </button>
    </div>
  );
}
