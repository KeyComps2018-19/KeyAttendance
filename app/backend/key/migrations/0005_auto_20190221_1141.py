# Generated by Django 2.1.7 on 2019-02-21 17:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('key', '0004_merge_20190215_2215'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='reports',
            options={'managed': True},
        ),
        migrations.AddField(
            model_name='cityspanstudents',
            name='id',
            field=models.AutoField(default=None, primary_key=True, serialize=False, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='cityspanstudents',
            name='student_key',
            field=models.TextField(blank=True),
        ),
    ]
