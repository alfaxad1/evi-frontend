import withAuth from "../../utils/withAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../src/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../components/ui/button/Button";
import { Search } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";


interface pendingRepayment {
  id: number;
  amount: number;
  phone_number: string;
  payment_name: string;
  due_date: string;
  paid_date: string;
  mpesa_code: string;
  created_at: string;
  total_amount: number;
  loan_status: string;
  customer_name: string;
  loan_id?: number;
  customer_id?: number;
  created_by?: number;
}

const PendingRepayments = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [pendingRepayments, setPendingRepayments] = useState<
    pendingRepayment[]
  >([]);

  const role = JSON.parse(localStorage.getItem("role") || "''");
  const officerId = localStorage.getItem("userId") || "";

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchString, setSearchString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [loanId, setLoanId] = useState<string | null>(null);
  const [selectedRepaymentId, setSelectedRepaymentId] = useState<number | null>(null);

  const handleResolveClick = (repaymentId: number) => {
    setSelectedRepaymentId(repaymentId);
    openModal();
  };

  const fetchPendingRepayments = useCallback(
    async (page: number): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${apiUrl}/api/repayments/pending?page=${page}`
        );
        console.log("Pending repayments fetched successfully: ", response.data);

        setPendingRepayments(response.data.data);
        console.log("total pages: ",response.data.meta.totalPages)
        setTotalPages(response.data.meta.totalPages);
      } catch (error) {
        console.error("Error fetching pending repayments:", error);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );
  useEffect(() => {
    fetchPendingRepayments(page);
  }, [role, officerId, page, fetchPendingRepayments]);

  if (loading) {
    return (
      <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50">
        <ClipLoader color="#36D7B7" size={50} speedMultiplier={0.8} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleResolveRepayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${apiUrl}/api/repayments/resolve-payment`,
        {},
        {params: {
            loanId: parseInt(loanId || "0"),
            paymentId: selectedRepaymentId
          },
        }
      );
      console.log(response.data);
      setLoanId(null);
      setSelectedRepaymentId(null);
      closeModal();
      toast.success(response.data);
      fetchPendingRepayments(page);
    } catch (error) {
      console.error("Error resolving repayment:", error);
      const axiosError = error as AxiosError;
      const errmsg = axiosError.response?.data || axiosError.message;
      console.log(errmsg);
      closeModal();
      toast.error(
        "Error: " +
          (typeof errmsg === "object" && errmsg !== null && "error" in errmsg
            ? (errmsg as { error: string }).error
            : errmsg)
      );
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };


  const filteredRepayments = pendingRepayments.filter((repayment) => {
    return (
      repayment.payment_name &&
      repayment.payment_name.toLowerCase().includes(searchString.toLowerCase())
    );
  });

  return (
    <>
      <ToastContainer position="bottom-right" />
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search />
        </span>
        <input
          type="text"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          placeholder="Search ..."
          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900  dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-screen-lg mx-auto">
          <div className="w-full overflow-x-auto">
            {pendingRepayments && pendingRepayments.length === 0 ? (
              <div className="text-center py-4 text-blue-500">
                No pending repayments.
              </div>
            ) : (
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Mpesa Code
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Time
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-blue-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredRepayments.map((repayment) => (
                    <TableRow key={repayment.id}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {repayment.amount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {repayment.mpesa_code}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {repayment.payment_name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {repayment.created_at.split("T")[0]}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {repayment.created_at.split("T")[1].split(".")[0]}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <button
                          onClick={() => handleResolveClick(repayment.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Resolve
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              size="sm"
              className="hover:bg-gray-200 m-4"
              variant="outline"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              className="hover:bg-gray-200 m-4"
              variant="outline"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] m-4">
                <div className="no-scrollbar relative w-auto max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                  <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                      Resolve Payment
                    </h4>
                  
                  </div>
                  <form className="flex flex-col" onSubmit={handleResolveRepayment}>
                    <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
                      <div className="mt-7">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
                          <div className="col-span-2 lg:col-span-1">
                            <Label>Enter the Loan Id: </Label>
                            <Input
                              type="number"
                              value={loanId || ""}
                              onChange={(e) => setLoanId(e.target.value)}
                              placeholder="123"
                              min="1"
                              required
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
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" type="submit">
                        Resolve
                      </Button>
                    </div>
                  </form>
                </div>
              </Modal>
      </div>
    </>
  );
};

const AuthenticatedPendingRepayments = withAuth(PendingRepayments);
export default AuthenticatedPendingRepayments;
