import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">

                {/* Icon & Title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <HiOutlineExclamationCircle size={22} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">{title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{message}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
}