# Backend Operations

| Operación | Consumidor | Tipo | Implementación | Tablas |
| --- | --- | --- | --- | --- |
| Obtener cuenta actual | Admin web | RPC | `get_current_account` | `users`, `user_roles`, `roles` |
| Obtener métricas | Admin web | RPC | `get_admin_dashboard` | varias |
| Crear usuario admin | Admin web | Edge Function | `admin-provision-user` | `auth.users`, `users`, `user_roles` |
| Obtener contenido educativo | Mobile | RPC | `get_educational_content_for_sync` | `educational_content` y relacionadas |
| Obtener amigos con perfil | Mobile | RPC | `get_friends_with_profile` | `friends`, `profiles` |
| Obtener mi código de amigo | Mobile | RPC | `get_my_friend_code` | `friend_codes` |
| Crear amistad por código | Mobile | RPC | `add_friend_by_code` | `friend_codes`, `friendships` |
