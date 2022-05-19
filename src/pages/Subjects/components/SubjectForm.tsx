import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle
} from '@mui/material';
import LoadingAsyncButton from 'components/LoadingAsyncButton/LoadingAsyncButton';
import React, { ReactNode, useState } from 'react';
import useLocales from 'hooks/useLocales';

interface Props extends Omit<Partial<DialogProps>, 'title'> {
  title: ReactNode;
  trigger: ReactNode;
  onCancle?: () => void;
  onOk: () => Promise<any>;
  children?: ReactNode;
}

const SubjectForm = ({ trigger, onOk: onSubmit, title, children, ...others }: Props) => {
  const [open, setOpen] = useState(false);
  const { translate } = useLocales();

  return (
    <>
      <span
        onClick={() => {
          setOpen(true);
        }}
      >
        {trigger}
      </span>
      <Dialog {...others} fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="outlined" color="inherit">
            {translate('common.cancel')}
          </Button>
          <LoadingAsyncButton
            variant="contained"
            onClick={() => onSubmit().then((res) => setOpen(Boolean(!res)))}
          >
            {translate('common.save')}
          </LoadingAsyncButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubjectForm;