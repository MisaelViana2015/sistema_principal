import { NavLink } from "react-router-dom";
import { Home, FileText, Wallet, TrendingUp, Car } from "lucide-react";

const navItems = [
    { to: "/turno", icon: Home, label: "Turno" },
    { to: "/corridas", icon: FileText, label: "Corridas" },
    { to: "/caixa", icon: Wallet, label: "Caixa" },
    { to: "/desempenho", icon: TrendingUp, label: "Desempenho" },
    { to: "/veiculos", icon: Car, label: "Veículos" },
];

export default function Navigation() {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#0e1118',
            borderTop: '4px solid #ff0037',
            zIndex: 50,
            padding: '20px 0'
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '-29px',
                flexWrap: 'wrap'
            }}>
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isSecondRow = index >= 3;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={{
                                width: '120px',
                                height: '104px',
                                position: 'relative',
                                marginLeft: index === 0 ? '0' : '-17px',
                                marginTop: isSecondRow ? '-52px' : '0',
                                transform: 'rotate(30deg)',
                                cursor: 'pointer',
                                zIndex: 0,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Hexágono SVG */}
                                    <svg
                                        viewBox="0 0 173.20508075688772 200"
                                        height="120"
                                        width="104"
                                        style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '-8px',
                                            transform: isActive ? 'scale(1.1)' : 'scale(0.87)',
                                            transition: 'all 0.3s ease',
                                            zIndex: -1
                                        }}
                                    >
                                        <path
                                            d="M86.60254037844386 0L173.20508075688772 50L173.20508075688772 150L86.60254037844386 200L0 150L0 50Z"
                                            fill={isActive ? '#ff0037' : '#1e2530'}
                                            style={{ transition: 'fill 0.3s ease' }}
                                        />
                                    </svg>

                                    {/* Conteúdo */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%) rotate(-30deg)',
                                        textAlign: 'center',
                                        color: isActive ? '#fff' : '#9ca3af',
                                        transition: 'color 0.3s ease'
                                    }}>
                                        <Icon style={{
                                            width: '24px',
                                            height: '24px',
                                            marginBottom: '8px',
                                            display: 'block',
                                            margin: '0 auto 8px',
                                            color: isActive ? '#fff' : '#9ca3af',
                                            transition: 'color 0.3s ease'
                                        }} />
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'block'
                                        }}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {/* Bordas hexagonais (efeito hover) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '30px',
                                        width: '60px',
                                        height: '104px',
                                        opacity: isActive ? 1 : 0,
                                        transform: isActive ? 'scale(1.2)' : 'scale(0.9)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {[0, 60, 120].map((rotation, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    width: '60px',
                                                    height: '104px',
                                                    transform: `rotate(${rotation}deg)`,
                                                    transformOrigin: 'center center'
                                                }}
                                            >
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    width: '100%',
                                                    height: '2px',
                                                    backgroundColor: '#ff0037',
                                                    transition: 'height 0.3s ease'
                                                }} />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    width: '100%',
                                                    height: '2px',
                                                    backgroundColor: '#ff0037',
                                                    transition: 'height 0.3s ease'
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>

            <style>{`
                nav a:hover svg path {
                    fill: #ff0037 !important;
                }
                nav a:hover div:first-of-type {
                    color: #fff !important;
                }
                nav a:hover div:first-of-type svg {
                    color: #fff !important;
                }
                nav a:hover {
                    z-index: 10 !important;
                }
                nav a:hover svg {
                    transform: scale(1.1) !important;
                }
            `}</style>
        </nav>
    );
}
