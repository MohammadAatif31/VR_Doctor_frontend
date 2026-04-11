export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999">

      <div className="bg-gray-900 p-6 rounded-2xl w-[90%] max-w-sm text-center border border-gray-700">

        <h2 className="text-lg font-bold mb-2">{title}</h2>

        <p className="text-gray-400 text-sm mb-5">
          {message}
        </p>

        <div className="flex gap-3">

          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-700 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 rounded-xl"
          >
            OK
          </button>

        </div>

      </div>
    </div>
  );
}