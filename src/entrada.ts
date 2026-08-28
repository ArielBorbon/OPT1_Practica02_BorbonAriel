import prompts from "prompts";

export async function pedirTexto(mensaje: string): Promise<string | undefined> {
  const respuesta = await prompts({ type: "text", name: "valor", message: mensaje });
  const valor: unknown = respuesta.valor;
  if (typeof valor !== "string") return undefined;
  
  const limpio = valor.trim();
  return limpio === "" ? undefined : limpio;
}

export async function pedirOpcion(
  mensaje: string,
  opciones: ReadonlyArray<{ readonly valor: string; readonly etiqueta: string }>
): Promise<string | undefined> {
  const respuesta = await prompts({
    type: "select",
    name: "valor",
    message: mensaje,
    choices: opciones.map((o) => ({ title: o.etiqueta, value: o.valor })),
    initial: 0,
  });
  
  const valor: unknown = respuesta.valor;
  return typeof valor === "string" ? valor : undefined;
}