import WellComeHeader from "./wellComeHeader";

interface policyInfoPropTypes {
    className?: string,
    policyInfo: {
        description: string;
        options: {
            marker: string;
            title: string;
            about: string;
        }[];
        fotterInfo: string;
    }
}


export function PolicyInfo({ className, policyInfo }: policyInfoPropTypes) {
    return (
        <div className={`p-2 ${className}`}>

            <WellComeHeader className="hidden md:block" />

            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-md">
                {/* Access your workspace, manage your activity,
                and stay in control of everything that matters. */}
                {policyInfo.description}
            </p>
            <div className="mt-10 space-y-6">
                {
                    (policyInfo.options).map((option, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="w-9 h-9 flex items-center justify-center rounded-lg 
                          bg-gray-800 border border-gray-700 text-sm font-semibold text-white">
                                {option.marker}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    {option.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {option.about}
                                </p>
                            </div>
                        </div>
                    ))
                }

                {/* <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg 
                          bg-gray-800 border border-gray-700 text-sm font-semibold text-white">
                        ✓
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Secure Authentication
                        </h3>
                        <p className="text-sm text-gray-400">
                            Industry-standard encryption and protection.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg 
                          bg-gray-800 border border-gray-700 text-sm font-semibold text-white">
                        ⚡
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Fast Performance
                        </h3>
                        <p className="text-sm text-gray-400">
                            Optimized for speed and reliability.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg 
                          bg-gray-800 border border-gray-700 text-sm font-semibold text-white">
                        🔒
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Full Data Control
                        </h3>
                        <p className="text-sm text-gray-400">
                            Your information stays private and protected.
                        </p>
                    </div>
                </div> */}

            </div>

            <div className="pt-10 border-t my-2 border-gray-800">
                <p className="text-xs text-gray-500">
                    Trusted by professionals worldwide.
                </p>
            </div>
        </div>
    )
}