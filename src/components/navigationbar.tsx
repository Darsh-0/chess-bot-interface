import { useState, useRef, useEffect } from "react";
import githubIcon from "../assets/github.png";

function GitHubDropdown() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const links = [
        {
            label: "Website Source",
            description: "Frontend & UI code",
            href: "https://github.com/Darsh-0/chess-bot-interface",
            icon: "🌐",
        },
        {
            label: "Bot Source",
            description: "Chess engine & AI logic",
            href: "https://github.com/Darsh-0/ChessEngine",
            icon: "♟️",
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="hover:cursor-pointer hover:opacity-75 transition-opacity duration-150"
                aria-label="Open GitHub links"
                aria-expanded={open}
            >
                <img src={githubIcon} alt="github icon" width={50} />
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-2 w-52 rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50
                     animate-[fadeSlideDown_0.15s_ease-out]"
                    style={{ animation: "fadeSlideDown 0.15s ease-out" }}
                >
                    {/* Arrow pointer */}
                    <div className="absolute -top-2 right-4 w-3 h-3 bg-white border-l-2 border-t-2 border-black rotate-45" />

                    <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 select-none">
                        View on GitHub
                    </p>

                    <ul className="p-2 flex flex-col gap-1">
                        {links.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors duration-100 group"
                                >
                                    <span className="text-2xl">{link.icon}</span>
                                    <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-black">
                      {link.label}
                    </span>
                                        <span className="text-xs text-gray-400">{link.description}</span>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

function NavigationBar() {
    return (
        <nav className="p-4 mx-20 flex justify-between items-center doodle-border bg-white rounded-lg" >
            <h1 className="text-5xl">Darsh's Chess Bot</h1>
            <GitHubDropdown />
        </nav>
    );
}

export default NavigationBar;