/**
 * Recusa as senhas que caem primeiro numa tentativa de adivinhação: as
 * mais comuns, repetições e a que contém o próprio nome, usuário ou
 * e-mail. Devolve o motivo, ou null se está boa.
 */
const COMUNS = [
  "1234567890",
  "12345678910",
  "0123456789",
  "senha12345",
  "senha123456",
  "password123",
  "qwertyuiop",
  "abcdefghij",
  "csempreendimentos",
  "cs12345678",
  "santarem123",
  "admin12345",
  "mudar12345",
];

export function senhaFraca(
  senha: string,
  pessoais: (string | null | undefined)[] = [],
): string | null {
  const s = senha.toLowerCase();
  if (COMUNS.some((c) => s.includes(c))) {
    return "Essa senha é muito comum. Escolha outra, de preferência uma frase.";
  }
  if (/^(.)\1+$/.test(s) || /^(\d+)$/.test(s)) {
    return "Use letras, e não só números ou um caractere repetido.";
  }
  for (const p of pessoais) {
    const base = (p ?? "").toLowerCase().split("@")[0].trim();
    if (base.length >= 4 && s.includes(base)) {
      return "A senha não pode conter o seu nome, usuário ou e-mail.";
    }
  }
  return null;
}
