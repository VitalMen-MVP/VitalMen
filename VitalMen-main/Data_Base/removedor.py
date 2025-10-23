import sqlite3

try:

 banco = sqlite3.connect('banco_vital_men.db')
 
 cursor = banco.cursor()

 cursor.execute ("DELETE from registro WHERE id = 4")

 banco.commit()
 
 banco.close()

 print("dados do usuario removidos")

except sqlite3.Error as error: print("Não foi possivel excluir: ",error)