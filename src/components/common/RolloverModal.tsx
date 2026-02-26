import React, { useState } from "react";
import axios from "axios";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";

interface RolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: number | null;
  onSuccess: () => void; // To refresh the list in the parent
}

const RolloverModal: React.FC<RolloverModalProps> = ({
  isOpen,
  onClose,
  loanId,
  onSuccess,
}) => {
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not authorized");
        return;
      }

      await axios.post(
        `${apiUrl}/api/loans/roll-over/${loanId}`,
        { principal: Number(totalAmount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Loan rolled over successfully");
      setTotalAmount("");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to roll over loan.");
        onClose();
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] m-4">
      <div className="no-scrollbar relative w-auto max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Roll Over Defaulted Loan
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter the new principal for this loan rollover
          </p>
        </div>

        <form className="flex flex-col" onSubmit={handleSave}>
          <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
            <div className="mt-7">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div className="col-span-1">
                  <Label>Principal</Label>
                  <Input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="Enter new loan amount"
                    min="1"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-center">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Roll Over Loan"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RolloverModal;
