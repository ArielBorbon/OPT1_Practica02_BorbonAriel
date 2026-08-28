# OPT1_Practica02_BorbonAriel
Practica 2 de Optativa: Temas Emergentes


¿por qué una unión de valores y no una enumeración?
se utiliza para mantenerla solamente en el desarrollo, ya que esta desaparecera al compilar, dejando el codigo JS limpio
si utilizaramos ENUM seria codigo extra en el codigo final de JS 



¿qué se gana con el tipo desconocido en lugar del que acepta todo?
Se utiliza unknown em lugar de any ya que con Any literalmente apagas Typescript, siendo una variable tratada como JS vanilla,
en cambio con unknown aunque no la declares en un inicio eventualmente tendras que tratarla comprobando el tipo de dato



¿por qué la fecha entra como parámetro?
se usa como parametro para poder utilizar fechas anteriores o futuras sin depender de la hora que tenemos en la PC, si utilizaramos
el New Date() no podriamos simular estos casos