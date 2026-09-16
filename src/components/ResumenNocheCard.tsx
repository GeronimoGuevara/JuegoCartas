interface ResumenNocheCardProps {
  titulo: string;
  valor: string | number;
  icono: string;
}

export default function ResumenNocheCard({ titulo, valor, icono }: ResumenNocheCardProps) {
  return (
    <div className="resumen-noche-card">
      <span className="resumen-icono">{icono}</span>
      <span className="resumen-valor">{valor}</span>
      <span className="resumen-titulo">{titulo}</span>
    </div>
  );
}
