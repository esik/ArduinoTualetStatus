#include <SPI.h>
#include <Ethernet.h>

/*Настройки подключения*/

byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0x85, 0xD9 };    // mac
byte ip[] = { 192, 168, 0, 105 };                       // ip 
byte subnet[] = { 255, 255, 255, 0 };                   // Маска
byte gateway[] = { 192, 168, 0, 1 };                    // Шлюз
EthernetServer server(80);                              // Порт


void setup()
{
  Ethernet.begin(mac,ip,gateway,subnet);    // Инициалзация Ethernet 
  server.begin();                           // Прослушивание клиентов
  pinMode(8, INPUT);                        // Входной вывод для кнопки
}

void loop()
{
  EthernetClient client = server.available();    // Поиск клиента

/*Послать заголовок http ответа*/

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connnection: close");
  client.println();

/*Web-страница, которая будет послана клиенту*/

  client.print("{\"status\":{\"first\":{\"occupied\":");

  if (digitalRead(8))
  {
    client.println("false");
  }
  else
  {
    client.println("true");
  }

  client.print("},\"second\":{\"occupied\":true}}}");

  delay(1);              // Время,приема данных

  client.stop();        //Останавливаем клиента,чтобы при следующем запуске цикла искать соединение EthernetClient client = server.available();

}
