import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3002, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users = new Map<string, { socketId: string;userName:string; role: string }>();
  private adminId: string | null = null;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const userName = client.handshake.query.userName as string;
    const role = client.handshake.query.role as string; // Nhận vai tr1ò (admin/client)


    if (!userId || !role) {
      client.disconnect();
      return;
    }

    this.users.set(userId, { socketId: client.id,userName, role });

    if (role === 'admin') {
      this.adminId = userId; // Xác định Admin
      // Gửi danh sách **tất cả khách hàng** cho Admin
      this.server.to(client.id).emit(
        'userList',
        [...this.users.entries()]
          .filter(([_, user]) => user.role === 'client')
          .map(([id, user]) => ({ id, userName: user.userName })) // Bao gồm userName
      );
    }
    

    console.log(`🔵 ${role.toUpperCase()} ${userId} kết nối với socket ${userName}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, user] of this.users.entries()) {
      if (user.socketId === client.id) {
        this.users.delete(userId);
        console.log(`🔴 ${user.role.toUpperCase()} ${userId} đã ngắt kết nối`);

        // Nếu là Client, cập nhật danh sách cho Admin
        if (user.role === 'client' && this.adminId) {
          const adminSocketId = this.users.get(this.adminId)?.socketId;
          if (adminSocketId) {
            this.server.to(adminSocketId).emit(
              'userList',
              [...this.users.entries()]
                .filter(([_, u]) => u.role === 'client')
                .map(([id,u]) => ({ id,  userName: u.userName}))
            );
          }
        }

        break;
      }
    }
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(client: Socket, payload: { to: string; text: string }) {
    const sender = [...this.users.entries()].find(
      ([, user]) => user.socketId === client.id
    );

    if (!sender) return;
    const [senderId, senderData] = sender;

    if (senderData.role === 'client' && this.adminId) {
      // Client chỉ có thể gửi tin nhắn cho Admin
      const adminSocketId = this.users.get(this.adminId)?.socketId;
      if (adminSocketId) {
        this.server.to(adminSocketId).emit('message', {
          senderId,
          text: payload.text,
        });
        console.log(`📩 Client ${senderId} gửi tin nhắn: ${payload.text}`);
      }
    } else if (senderData.role === 'admin') {
      // Admin gửi tin nhắn cho một Client
      const recipientSocketId = this.users.get(payload.to)?.socketId;
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('message', {
          senderId: 'admin',
          text: payload.text,
        });
        console.log(`📩 Admin gửi tin nhắn tới ${payload.to}: ${payload.text}`);
      }
    }
  }
  @SubscribeMessage('adminMessage')
  handleAdminMessage(client: Socket, payload: { to: string; text: string }) {
  const sender = [...this.users.entries()].find(
    ([, user]) => user.socketId === client.id
  );

  if (!sender || sender[1].role !== 'admin') return;

  const recipientSocketId = this.users.get(payload.to)?.socketId;
  if (recipientSocketId) {
    this.server.to(recipientSocketId).emit('message', {
      senderId: 'admin',
      text: payload.text,
    });
    console.log(`📩 Admin gửi tin nhắn tới ${payload.to}: ${payload.text}`);
  }
}
}
