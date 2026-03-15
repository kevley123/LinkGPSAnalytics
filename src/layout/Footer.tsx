export default function Footer() {
  return (
    <footer className="h-10 shrink-0 border-t border-brand-dark-4 flex items-center px-6 gap-4">
      <p className="text-neutral-600 text-[10px]">
        © {new Date().getFullYear()} LinkGPS Analytics. Todos los derechos reservados.
      </p>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <p className="text-neutral-600 text-[10px]">Sistema operativo</p>
      </div>
    </footer>
  );
}
