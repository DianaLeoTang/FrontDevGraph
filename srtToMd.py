import re
import jieba
import os
from collections import defaultdict
import logging

jieba.setLogLevel(logging.INFO)

class SRTToMindmap:
    def __init__(self):
        # 扩充主题相关词汇
        self.topic_words = {
            'Chrome浏览器渲染': [
                '浏览器', '渲染', 'DOM', 'CSS', '排版', '处理', '性能', '显卡',
                '渲染过程', '解析', '绘制', '布局', 'HTML', '样式', '脚本',
                '处理器', '硬件', '加速', '优化', 'GPU', '显示'
            ],
            'Webpack': [
                'webpack', '打包', '构建', '配置', '插件', 'loader', '编译',
                '入口', '出口', '模块', '依赖', '优化', '压缩', '项目', '工程化',
                '脚手架', '开发环境', '生产环境'
            ],
            'Jenkins': [
                'Jenkins', '构建', '部署', '集成', '自动化', '流水线', '任务',
                '项目', '配置', '插件', '权限', '节点', '构建历史', '触发器',
                '参数化', '凭据'
            ]
        }
        
        self.important_words = {
            '时序词': ['首先', '其次', '然后', '最后', '接着', '第一', '第二', '第三'],
            '总结词': ['总之', '因此', '所以', '总的来说', '总结'],
            '转折词': ['但是', '不过', '然而', '相反', '另外'],
            '强调词': ['重点', '核心', '关键', '主要', '特别'],
            '解释词': ['就是', '也就是说', '换句话说', '即', '例如']
        }

    def convert_file(self, file_path):
        """转换单个SRT文件"""
        try:
            # 从文件名中提取主题
            filename = os.path.basename(file_path)
            main_topic = self._extract_topic_from_filename(filename)
            print(f"\n主题: {main_topic}")
            
            # 读取并清理内容
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            sentences = self._clean_content(content)
            
            # 提取主题相关内容
            topics = self._extract_topics(sentences, main_topic)
            
            # 生成markdown
            markdown = self._generate_markdown(topics, main_topic)
            
            # 保存文件
            output_path = os.path.splitext(file_path)[0] + '.md'
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            print(f"已保存到: {output_path}")
            
        except Exception as e:
            print(f"处理文件出错: {e}")

    def _extract_topic_from_filename(self, filename):
        """从文件名中提取主题"""
        # 移除扩展名和序号
        name = os.path.splitext(filename)[0]
        name = re.sub(r'^\[\d+\.\d+\]--', '', name)
        name = name.replace('【实战】', '')
        name = name.replace('内幕', '')
        return name.strip()

    def _clean_content(self, content):
        """清理内容"""
        # 按行分割
        lines = content.split('\n')
        valid_lines = []
        
        for line in lines:
            line = line.strip()
            
            # 跳过无效行
            if not line or line.isdigit() or '-->' in line:
                continue
            # 跳过纯英文行
            if re.match(r'^[a-zA-Z\s,\.]+$', line):
                continue
                
            valid_lines.append(line)
        
        # 合并并分句
        text = ' '.join(valid_lines)
        sentences = re.split(r'[。！？]', text)
        return [s.strip() for s in sentences if len(s.strip()) > 5]

    def _extract_topics(self, sentences, main_topic):
        """提取主题相关内容"""
        topics = defaultdict(list)
        current_section = "概述"
        
        # 获取主题相关词汇
        topic_keywords = []
        for topic, keywords in self.topic_words.items():
            if any(word in main_topic for word in keywords):
                topic_keywords.extend(keywords)
        
        # 如果没有找到相关词汇，使用文件名中的关键词
        if not topic_keywords:
            topic_keywords = [word for word in jieba.lcut(main_topic) if len(word) > 1]
        
        for sentence in sentences:
            # 分词
            words = jieba.lcut(sentence)
            
            # 检查是否包含主题相关词汇
            is_relevant = any(keyword in sentence for keyword in topic_keywords)
            
            # 检查是否是章节标题
            is_section = False
            for category, markers in self.important_words.items():
                if any(marker in sentence for marker in markers):
                    if len(sentence) > 10:  # 避免太短的句子作为标题
                        current_section = sentence
                        is_section = True
                        break
            
            # 如果是相关内容且不是章节标题，添加为子主题
            if is_relevant and not is_section:
                topics[current_section].append(sentence)
        
        # 如果没有找到任何内容，添加所有主题相关的句子
        if not topics:
            topics["主要内容"] = [s for s in sentences if any(keyword in s for keyword in topic_keywords)]
            
        return topics

    def _generate_markdown(self, topics, main_topic):
        """生成markdown"""
        lines = [f"# {main_topic}\n"]
        
        # 如果没有内容，添加提示
        if not topics:
            lines.append("\n> 未找到相关主题内容\n")
            return ''.join(lines)
        
        # 添加主题和子主题
        for topic, subtopics in topics.items():
            if subtopics:  # 只添加有内容的主题
                lines.append(f"\n## {topic}\n")
                # 去重并添加子主题
                unique_subtopics = list(set(subtopics))
                for subtopic in unique_subtopics:
                    lines.append(f"- {subtopic}\n")
        
        return ''.join(lines)

    def convert_directory(self, directory_path):
        """处理目录下的所有SRT文件"""
        for filename in os.listdir(directory_path):
            if filename.endswith('.srt'):
                file_path = os.path.join(directory_path, filename)
                print(f"\n处理文件: {filename}")
                self.convert_file(file_path)

if __name__ == "__main__":
    # 获取当前脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"当前目录: {script_dir}")
    
    # 处理文件
    converter = SRTToMindmap()
    converter.convert_directory(script_dir)