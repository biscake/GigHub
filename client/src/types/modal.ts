export type CreateGigModalProps = {
  isCreateGigModalOpen: boolean;
  setIsCreateGigModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export type WarningModalProps = {
  showCloseWarning: boolean;
  setShowCloseWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
}