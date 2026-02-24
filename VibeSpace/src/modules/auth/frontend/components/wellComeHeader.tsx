

function WellComeHeader({ className }: { className?: string }) {
    return (
        <div className={`p-2 mt-4 max-w-md w-full ${className}`}>
            <span className="text-3xl font-medium text-gray-400 tracking-wide">
                VibeIn
            </span>

            <h1 className="mt-2 text-4xl font-semibold text-white leading-tight">
                Welcome Back
            </h1>
        </div>
    )
}

export default WellComeHeader